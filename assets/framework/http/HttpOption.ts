export class HttpOption{
    host:string = null;
    port:number = null;
    timeout:number = null;
    cookieKey:string = null;
    headers = new Map<string, any>();
}