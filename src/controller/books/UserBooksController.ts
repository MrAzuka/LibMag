import { BookEntity } from "../../entity/BookEntity"
import { AppDataSource } from "../../data-source"
import { Response, Request } from "express"
// import Redis from "ioredis";


// Create a Redis client
// const redis: Redis = new Redis();
const bookRepository = AppDataSource.getRepository(BookEntity)

export const GetAllBooks = async (req: Request, res: Response) => {
    try {
        const builder = bookRepository.createQueryBuilder("book")

        if (req.query.search) {
            builder.where(
                "book.title LIKE :search OR book.author LIKE :search OR book.description LIKE :search",
                { search: `%${req.query.search}%` })
        }

        const sort: any = req.query.sort

        if (sort) {
            builder.orderBy("book.title", sort.toUpperCase())
        }

        const page: number = parseInt(req.query.page as string) || 1
        const perPage = 5
        const total = await builder.getCount()

        builder.offset((page - 1) * perPage).limit(perPage)
        // await redis.set('cachedData', JSON.stringify(builder.getMany()), 'EX', 3600); // Cache for 1 hour
        return res.status(200).json({
            success: true,
            message: "fetched all books",
            data: await builder.getMany(),
            total,
            page,
            last_page: Math.ceil(total / perPage)
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "An error occurred." });
    }
}


export const GetBookById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const bookData = await bookRepository.findOneBy({ book_id: id })
        if (!bookData) return res.status(400).json({ success: false, message: "Book Not Found" });
        // await redis.set('cachedData', JSON.stringify(bookData), 'EX', 3600); // Cache for 1 hour
        return res.status(200).json({
            success: true,
            message: "Book found",
            data: bookData
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "An error occurred." });
    }
}
