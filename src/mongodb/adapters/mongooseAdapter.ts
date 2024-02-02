import { Document, Model, model, Schema } from 'mongoose';

interface Session {
    data: any;
}

interface SessionDocument extends Session, Document {}

const sessionSchema = new Schema<SessionDocument>({
    _id: String,
    data: Schema.Types.Mixed
});

const SessionModel: Model<SessionDocument> = model('Session', sessionSchema);

export class MongooseAdapter {
    async read(id: string) {
        const session = await SessionModel.findById(id);
        return session ? session.data : undefined;
    }

    async write(id: string, data: any) {
        await SessionModel.findByIdAndUpdate(id, { data }, { upsert: true });
    }

    async delete(id: string) {
        await SessionModel.findByIdAndDelete(id);
    }
}

// const bot = new Bot<Context & SessionFlavor<{}>>('YOUR_BOT_TOKEN');
// bot.use(session({ initial: () => ({}), storage: new MongooseAdapter() }));

// bot.command('start', (ctx) => ctx.reply('Hello, world!'));
// bot.start();
