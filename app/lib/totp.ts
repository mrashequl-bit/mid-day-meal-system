const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function generateTotpSecret() {
  const bytes = new Uint8Array(20); crypto.getRandomValues(bytes);
  let bits = ""; for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  let out = ""; for (let i=0;i<bits.length;i+=5) out += alphabet[parseInt(bits.slice(i,i+5).padEnd(5,"0"),2)];
  return out;
}
function decodeBase32(value:string){let bits="";for(const char of value.replace(/=+$/g,"").toUpperCase()){const i=alphabet.indexOf(char);if(i>=0)bits+=i.toString(2).padStart(5,"0");}const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));return new Uint8Array(bytes)}
async function codeAt(secret:string,counter:number){const buffer=new ArrayBuffer(8);new DataView(buffer).setBigUint64(0,BigInt(counter),false);const key=await crypto.subtle.importKey("raw",decodeBase32(secret),{name:"HMAC",hash:"SHA-1"},false,["sign"]);const hash=new Uint8Array(await crypto.subtle.sign("HMAC",key,buffer));const offset=hash[hash.length-1]&15;const code=((hash[offset]&127)<<24)|((hash[offset+1]&255)<<16)|((hash[offset+2]&255)<<8)|(hash[offset+3]&255);return String(code%1_000_000).padStart(6,"0")}
export async function verifyTotp(secret:string,code:string){const now=Math.floor(Date.now()/30000);for(let drift=-1;drift<=1;drift++)if(await codeAt(secret,now+drift)===code.replace(/\s/g,""))return true;return false}

