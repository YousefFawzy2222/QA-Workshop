declare module 'mssql' {
  export interface config {
    server: string;
    database: string;
    user: string;
    password: string;
    options?: {
      encrypt?: boolean;
      trustServerCertificate?: boolean;
      enableArithAbort?: boolean;
    };
    pool?: {
      max?: number;
      min?: number;
      idleTimeoutMillis?: number;
    };
  }

  export interface IResult<T = any> {
    recordsets: T[][];
    recordset: T[];
    output: any;
    rowsAffected: number[];
  }

  export interface IRequest {
    input(name: string, type: any, value: any): IRequest;
    query(command: string): Promise<IResult>;
  }

  export class ConnectionPool {
    constructor(config: config);
    connect(): Promise<ConnectionPool>;
    close(): Promise<void>;
    request(): IRequest;
  }

  export const NVarChar: any;
  export const Int: any;
  export const Float: any;
  export const Bit: any;

  const sql: {
    ConnectionPool: typeof ConnectionPool;
    NVarChar: any;
    Int: any;
    Float: any;
    Bit: any;
  };

  export default sql;
}
