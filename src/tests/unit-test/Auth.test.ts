import request from "supertest"
import server from "../../index"
import { deleteMockUser } from "../mock/User.mock"
import { AppDataSource } from "../../data-source";

let username: string = "Test";
let email: string = "Test@test.com";
let password: string = "passwordTest";
let userid: string = username || email
let existingUserEmail: string = "oliseh35@gmail.com"
let nonExistingUserId: string = "Not Exist"
let wrongPassword: string = "fake password"




describe("Registeration & Login Endpoints", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });

    test("Register Success", async () => {
        const res = await request(server).post("/api/auth/register").send({ username, email, password })

        expect(res.statusCode).toBe(201)
        expect(res.body.message).toBe("Signup success.")
        expect(res.body.success).toBeTruthy
    })

    test("Missing Username input", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({ email, password })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("User fields are required.")
        expect(res.body.success).toBeFalsy
    })

    test("Missing Email input", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({ username, password })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("User fields are required.")
        expect(res.body.success).toBeFalsy
    })

    test("Missing Password input", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({ email, username })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("User fields are required.")
        expect(res.body.success).toBeFalsy
    })

    test("User Already Exists", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({ username: username, email: existingUserEmail, password: password })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("User already exists.")
        expect(res.body.success).toBeFalsy
    })

    test("User Does Not Exists", async () => {
        const res = await request(server)
            .post("/api/auth/login")
            .send({ userid: nonExistingUserId, password: password })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("User does not exist.")
        expect(res.body.success).toBeFalsy
    })

    test("Wrong Password Input", async () => {
        const res = await request(server)
            .post("/api/auth/login")
            .send({ userid: userid, password: wrongPassword })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("wrong password or userid")
        expect(res.body.success).toBeFalsy
    })

    test("Login Success", async () => {
        const res = await request(server)
            .post("/api/auth/login")
            .send({ userid, password })

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe("Login Success")
        expect(res.body.success).toBeTruthy
        expect(res.body.token).not.toBeNull
    })

    test("Missing UserId input", async () => {
        const res = await request(server)
            .post("/api/auth/login")
            .send({ password })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("userid and password are required.")
        expect(res.body.success).toBeFalsy
    })

    test("Missing Password input", async () => {
        const res = await request(server)
            .post("/api/auth/login")
            .send({ userid })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("userid and password are required.")
        expect(res.body.success).toBeFalsy
    })

    afterAll(async () => {
        await deleteMockUser(email)

        await AppDataSource.destroy();

        server.close();
    });
})
