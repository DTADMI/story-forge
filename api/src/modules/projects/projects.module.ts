import {Module} from '@nestjs/common';
import {ProjectsController} from './projects.controller';
import {ProjectsService} from './projects.service';
import {SocialModule} from '../social/social.module';

@Module({
    imports: [SocialModule],
    controllers: [ProjectsController],
    providers: [ProjectsService],
})
export class ProjectsModule {
}
