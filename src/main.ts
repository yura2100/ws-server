import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import { WorkerModule } from './worker/worker.module'
import { ConfigService } from '@nestjs/config'
const cluster = require('cluster')
const os = require('os')

async function bootstrapMain() {
    const app = await NestFactory.create(AppModule)

    app.useWebSocketAdapter(new WsAdapter(app))

    const configService = app.get(ConfigService)

    const port = configService.get('port')

    await app.listen(port)
}

async function bootstrapWorker() {
    const app = await NestFactory.createApplicationContext(WorkerModule)
}

async function main() {
    if (cluster.isMaster) {
        const cpusCount = os.cpus().length

        for (let i = 0; i < cpusCount - 1; i++) {
            const worker = cluster.fork()

            worker.on('exit', cluster.fork)
        }

        bootstrapMain()
    } else if (cluster.isWorker) {
        bootstrapWorker()
    }
}

main()