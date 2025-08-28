import DOMPurify from "dompurify";

export function sanitizeInput(input:string):string {
    return DOMPurify.sanitize(input);
}

export function getOrCreateUserId():string {
    const key = "izzybot_user_id";
    let userId = localStorage.getItem(key);

    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem(key, userId)
    }

    return userId;
}