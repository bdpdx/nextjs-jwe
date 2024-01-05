import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env/env.validation';
// import { INestApplication } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { NestFactory } from '@nestjs/core';

// let app: INestApplication;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService<EnvironmentVariables, true>);
    const loggerService = new LoggerService(configService);

    const appName = configService.get('APP_NAME');
    const bindHost = configService.get('BIND_HOST');
    const bindPort = configService.get('BIND_PORT');

    loggerService.setAppName(appName);
    loggerService.setContext('App');
    app.useLogger(loggerService);

    await app.listen(bindPort, bindHost, () => {
        loggerService.log(`Listening on ${bindHost}:${bindPort}`);
    });
}

bootstrap();

/*
    2024.01.02 bd: I'm not sure why I thought it'd be a good idea to be able to access the app
    service instance elsewhere in the app but there's a stackoverflow post about how to do it
    and making a global app: INestInstance along with an accessor seems to be the way to do it.

    I'm commenting all of this out for now as this seems to be a separation of concerns violation.

    To use:

    import { getInstance } from '@/main';

    static async f() {
        const service = await getInstance().resolve(Service);
        service.method();
    }
*/
// export const getInstance = () => {
//     return app;
// };
