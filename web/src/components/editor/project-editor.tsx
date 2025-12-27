'use client';

import {useEffect, useState} from 'react';
import {Editor} from '@/components/editor/editor';
import {useRouter} from 'next/navigation';

interface ProjectEditorProps {
    project: {
        id: string;
        title: string;
        description?: string;
        content?: string;
        defaultScope: string;
    };
    userPreferences?: {
        breakReminders?: boolean;
    };
}

export function ProjectEditor({project, userPreferences}: ProjectEditorProps) {
    const [content, setContent] = useState(project.content || '');
    const [saving, setSaving] = useState(false);
    const [lastBreak, setLastBreak] = useState(Date.now());
    const router = useRouter();

    useEffect(() => {
        if (!userPreferences?.breakReminders) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const minsSinceBreak = (now - lastBreak) / 1000 / 60;
            if (minsSinceBreak >= 45) {
                if (confirm('You have been writing for 45 minutes. Take a short break to stay fresh!')) {
                    setLastBreak(now);
                } else {
                    // SNOOZE: add 15 mins
                    setLastBreak(now - (30 * 60 * 1000));
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [lastBreak, userPreferences?.breakReminders]);

    const handleSave = async (newContent: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({content: newContent}),
            });
            if (res.ok) {
                // Success
            }
        } catch (err) {
            console.error('Failed to save', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">{project.title}</h1>
                {saving && <span className="text-sm text-fg/50 animate-pulse">Saving...</span>}
            </div>
            <Editor
                content={content}
                onChange={setContent}
                onSave={handleSave}
            />
        </div>
    );
}
