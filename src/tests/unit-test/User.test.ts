import request from "supertest"
import server from "../../index"
import { deleteMockUser } from "../mock/User.mock"
import { AppDataSource } from "../../data-source";

let username: string = "Test";
let email: string = "Test@test.com";
let password: string = "passwordTest";
let userid: string = username || email
let token: string





describe("Registeration & Login Endpoints", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
        await request(server).post("/api/auth/register").send({ username, email, password })
        const res = await request(server).post("/api/auth/login").send({ userid, password })
        token = res.body.token
    });

    test("Get User Profile", async () => {
        const res = await request(server)
            .get("/api/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("fetch success");
        expect(res.body.success).toBeTruthy
        expect(res.body.data).not.toBeNull
    });

    test("Update User Profile", async () => {
        const res = await request(server)
            .put("/api/profile")
            .send({first_name: "First Test", last_name: "Last Test"})
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("profile update success");
        expect(res.body.success).toBeTruthy
    });

    test("Can't Update User Password", async () => {
        const res = await request(server)
            .put("/api/profile")
            .send({password: "First Test"})
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("cannot update password");
        expect(res.body.success).toBeFalsy
    });

    afterAll(async () => {
        await deleteMockUser(email)

        await AppDataSource.destroy();

        server.close();
    });
})
