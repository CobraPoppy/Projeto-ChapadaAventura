// Logger simples estruturado
export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(JSON.stringify({ level: "info", msg, ...meta, ts: new Date().toISOString() }));
  },
  error: (msg: string, meta?: any) => {
    console.error(JSON.stringify({ level: "error", msg, ...meta, ts: new Date().toISOString() }));
  }
};
