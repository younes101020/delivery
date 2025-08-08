import { jwtVerify, SignJWT } from "jose";
// eslint-disable-next-line node/no-process-env
const key = new TextEncoder().encode(process.env.AUTH_SECRET);
export async function signToken(payload) {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1 day from now")
        .sign(key);
}
export async function verifyToken(input) {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}
//# sourceMappingURL=index.js.map