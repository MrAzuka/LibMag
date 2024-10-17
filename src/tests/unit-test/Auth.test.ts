import request from "supertest"
import server from "../../index"
import { deleteMockUser, newMockUser } from "../mock/User.mock"
import { AppDataSource } from "../../data-source";

let username: string = "Test";
let email: string = "Test@test.com";
let password: string = "passwordTest";

beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await deleteMockUser(email)

    await AppDataSource.destroy();

    server.close();
});


describe("Test Authentication Endpoints", () => {
    test("Register", async () => {
        const res = await request(server).post("/api/auth/register").send({ username, email, password })

        expect(res.statusCode).toBe(201)
        expect(res.body.message).toBe("Signup success.")
        expect(res.body.success).toBeTruthy
    })
})
