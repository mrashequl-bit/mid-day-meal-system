import { env } from "cloudflare:workers";
async function key(){const configured=env.SETTINGS_ENCRYPTION_KEY?.trim();if(!configured)throw new Error("SETTINGS_ENCRYPTION_KEY deployment secret সেট করা আবশ্যক।");const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(configured));return crypto.subtle.importKey("raw",digest,"AES-GCM",false,["encrypt","decrypt"])}
export async function seal(value:string){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(),new TextEncoder().encode(value)));return `${Buffer.from(iv).toString("base64url")}.${Buffer.from(encrypted).toString("base64url")}`}
export async function unseal(value:string){const [a,b]=value.split(".");const iv=new Uint8Array(Buffer.from(a,"base64url"));const data=new Uint8Array(Buffer.from(b,"base64url"));return new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv},await key(),data))}

