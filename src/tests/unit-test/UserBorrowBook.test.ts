import request from "supertest";
import server from "../../index";
import { AppDataSource } from "../../data-source";
import { deleteMockUser } from "../mock/User.mock";
import { BookEntity } from "../../entity/BookEntity"
import { BorrowedBookEntity } from "../../entity/BorrowBookEntity"
import { UserEntity } from "../../entity/UserEntity"

const userRepository = AppDataSource.getRepository(UserEntity)
const bookRepository = AppDataSource.getRepository(BookEntity)
const borrowBookRepository = AppDataSource.getRepository(BorrowedBookEntity)
let username: string = "Test";
let email: string = "Test@test.com";
let password: string = "passwordTest";
let userid: string = username || email;
let token: string;
let record_id: any;
let book_id: string = "086009c0-d9c8-4c92-b523-20323015a706"

describe("Return Book Endpoint", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
        await request(server).post("/api/auth/register").send({ username, email, password });
        const res = await request(server).post("/api/auth/login").send({ userid, password });
        token = res.body.token;

        // Add mock book and borrow it
        const bookRes: any = await bookRepository.findOneBy({book_id: book_id})
        let findUser: any = await userRepository.findOneBy({ user_id: res.body.user })

        const borrowRes = await borrowBookRepository.save({
            user: findUser,
            book: bookRes,
            borrow_date: new Date(),
            status: "borrowed",
        });

        record_id = borrowRes.record_id;
    });

    test("Book Not Available", async () => {
        // Set available copies to 0
        await bookRepository.update({ book_id: book_id }, { available_copies: 0 });

        const res = await request(server)
            .post("/api/borrow")
            .set("Authorization", `Bearer ${token}`)
            .send({ book_id });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBeFalsy();
        expect(res.body.message).toBe("book not available");
    });

    test("Book Not Found", async () => {
        const res = await request(server)
            .post("/api/borrow")
            .set("Authorization", `Bearer ${token}`)
            .send({ book_id: "01fac18c-7ece-47d7-8800-d997cb94daaa" });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBeFalsy();
        expect(res.body.message).toBe("error fetching book");
    });

    test("Return Book Success", async () => {
        const res = await request(server)
            .post("/api/return")
            .set("Authorization", `Bearer ${token}`)
            .send({ record_id: record_id });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBeTruthy();
        expect(res.body.message).toBe("Booking return processing");
    });


    test("Return Book Record Not Found", async () => {
        const res = await request(server)
            .post("/api/return")
            .set("Authorization", `Bearer ${token}`)
            .send({ record_id: "01fac18c-7ece-47d7-8800-d997cb94daaa" });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBeFalsy();
        expect(res.body.message).toBe("error fetching record");
    });

    test("Cannot Renew Already Returned Book", async () => {
        // Update the borrowBook record to mark it as returned
        await borrowBookRepository.update({ record_id }, { status: "returned" });

        const res = await request(server)
            .post("/api/renew")
            .set("Authorization", `Bearer ${token}`)
            .send({ record_id });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBeFalsy();
        expect(res.body.message).toBe("cannot renew. Book already returned");
    });

    afterAll(async () => {
        await deleteMockUser(email);
        await borrowBookRepository.delete({ record_id });
        await AppDataSource.destroy();
        server.close();
    });
});
