import { neo4jQuery } from "./neo4j";

export async function syncCharacterToNeo4j(char: {
  id: string;
  name: string;
  projectId?: string | null;
}) {
  await neo4jQuery(
    `MERGE (c:Character {id: $id}) SET c.name = $name, c.projectId = $projectId, c.updatedAt = datetime()`,
    { id: char.id, name: char.name, projectId: char.projectId || null }
  );
}

export async function syncRelationshipToNeo4j(rel: {
  characterId: string;
  relatedId: string;
  type: string;
}) {
  await neo4jQuery(
    `MATCH (c1:Character {id: $charId}), (c2:Character {id: $relId})
     MERGE (c1)-[r:RELATES_TO {type: $type}]->(c2)`,
    { charId: rel.characterId, relId: rel.relatedId, type: rel.type }
  );
}

export async function deleteRelationshipFromNeo4j(rel: {
  characterId: string;
  relatedId: string;
  type: string;
}) {
  await neo4jQuery(
    `MATCH (c1:Character {id: $charId})-[r:RELATES_TO {type: $type}]->(c2:Character {id: $relId})
     DELETE r`,
    { charId: rel.characterId, relId: rel.relatedId, type: rel.type }
  );
}

export async function syncEventToNeo4j(event: {
  id: string;
  title: string;
  projectId?: string | null;
}) {
  await neo4jQuery(`MERGE (e:Event {id: $id}) SET e.title = $title, e.projectId = $projectId`, {
    id: event.id,
    title: event.title,
    projectId: event.projectId || null,
  });
}

export async function syncEventCharacterLink(eventId: string, characterId: string) {
  await neo4jQuery(
    `MATCH (e:Event {id: $eventId}), (c:Character {id: $charId})
     MERGE (e)-[r:INVOLVES]->(c)`,
    { eventId, charId: characterId }
  );
}

export async function deleteCharacterFromNeo4j(id: string) {
  await neo4jQuery(`MATCH (c:Character {id: $id}) DETACH DELETE c`, { id });
}

export async function fullResync() {
  const { prisma } = await import("@/lib/prisma");
  await neo4jQuery(`MATCH (n) DETACH DELETE n`);
  const chars = await prisma.character.findMany();
  for (const c of chars) await syncCharacterToNeo4j(c);
  const rels = await prisma.characterRelationship.findMany();
  for (const r of rels) await syncRelationshipToNeo4j(r);
  const events = await prisma.timelineEvent.findMany({ include: { characters: true } });
  for (const e of events) {
    await syncEventToNeo4j(e);
    for (const c of e.characters) await syncEventCharacterLink(e.id, c.id);
  }
}
