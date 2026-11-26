import { bootstrapServer } from '../src/server';

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
