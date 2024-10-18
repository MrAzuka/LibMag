import request from "supertest"
import server from "../../index"
import { deleteMockUser } from "../mock/User.mock"
import { AppDataSource } from "../../data-source";

let username: string = "Test";
let email: string = "Test@test.com";
let password: string = "passwordTest";
let userid: string = username || email
let token: string
let bookid: string

describe("Book Endpoints", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
        await request(server).post("/api/auth/register").send({ username, email, password })
        const res = await request(server).post("/api/auth/login").send({ userid, password })
        token = res.body.token
    });

    test("Fetch all books without filters", async () => {
        const res = await request(server)
            .get("/api/books")
            .set("Authorization", `Bearer ${token}`);
        bookid = res.body.data[0].book_id
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.page).toBe(1);
    });

    test("Fetch books with search filter", async () => {
        const res = await request(server)
            .get("/api/books")
            .query({ search: "Test" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
    });

    test("Fetch books with sorting", async () => {
        const res = await request(server)
            .get("/api/books")
            .query({ sort: "asc" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);   
    });

    test("Fetch books with pagination", async () => {
        const res = await request(server)
            .get("/api/books")
            .query({ page: 2 })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.page).toBe(2);
        expect(res.body.data).toBeInstanceOf(Array);
    });

    test("Fetch a book by ID", async () => {
        // Assuming you have some predefined book in your test database with book_id

        const res = await request(server)
            .get(`/api/books/${bookid}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("book_id", bookid); 
    });

    test("Fetch book with invalid ID", async () => {
        // Use a non-existent book ID for this test
        const invalidBookId = "2882b940-0a8b-4795-b266-03c306d11336";

        const res = await request(server)
            .get(`/api/books/${invalidBookId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Book Not Found");
    });

    test("Fetch book with invalid ID format", async () => {
        const invalidBookId = 1;

        const res = await request(server)
            .get(`/api/books/${invalidBookId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(500); 
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("An error occurred.");
    });


    afterAll(async () => {
        await deleteMockUser(email)

        await AppDataSource.destroy();

        server.close();
    });
})
