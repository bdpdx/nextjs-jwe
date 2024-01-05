import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, Module } from '@nestjs/common';
import * as jose from 'jose';
import { JWE_MODULE_OPTIONS, JweAlgorithm, JweKey } from './jwe.interfaces';
import { JweService } from './jwe.service';

@Module({
    exports: [JweService],
    providers: [
        {
            inject: [ConfigService],
            provide: JWE_MODULE_OPTIONS,
            useFactory: jweModuleOptionsFactory,
        },
        JweService,
    ],
})
export class JweModule {
    // 2024.01.04 bd: I don't see any reason right now to support a global
    // JweModule (it's only used by the AuthModule), so I'm commenting out
    // this register() method. If for some reason it becomes necessary to
    // support a global JweModule or provide additional module metadata then
    // this can be used.
    /*
    static register(metadata: JweModuleMetadata = {}): DynamicModule {
        const providers = [
            ...(metadata.providers ?? []),
            {
                inject: [ConfigService],
                provide: JWE_MODULE_OPTIONS,
                useFactory: jweModuleOptionsFactory,
            },
        ];

        return {
            global: metadata?.global,
            imports: metadata?.imports,
            module: JweModule,
            providers: providers,
        };
    }
    */
}

async function jweModuleOptionsFactory(configService: ConfigService) {
    const algorithm = configService.getOrThrow('JWE_ALGORITHM');

    let key: JweKey;

    switch (algorithm) {
        case JweAlgorithm.HS256:
            const secret = configService.getOrThrow('JWE_SECRET');
            key = Uint8Array.from(Buffer.from(secret, 'hex'));
            break;

        case JweAlgorithm.RS256:
            const privateKey = configService.getOrThrow('JWE_PRIVATE_KEY');
            // const publicKey = configService.getOrThrow('JWE_PUBLIC_KEY');
            key = await jose.importPKCS8(privateKey, algorithm);
            break;

        default:
            throw new InternalServerErrorException();
    }

    const audience = configService.getOrThrow('JWE_AUDIENCE');
    const expirationTime = configService.getOrThrow('JWE_EXPIRATION_TIME');
    const issuer = configService.getOrThrow('JWE_ISSUER');
    const signOptions = {
        audience: audience,
        expirationTime: expirationTime,
        issuer: issuer,
    };

    return {
        algorithm: algorithm,
        key: key,
        signOptions: signOptions,
    };
}
