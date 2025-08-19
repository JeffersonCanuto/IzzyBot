import DOMPurify from "dompurify";

export function sanitizeInput(input:string):string {
    return DOMPurify.sanitize(input);
}