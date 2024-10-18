import { UserEntity } from "../../entity/UserEntity"
import { AppDataSource } from "../../data-source"
import { Response, Request } from "express"
import { salt, jwtSecretKey } from "../../config"
import { WelcomeMessage } from "../../utils/HtmlEmailTemplate"
import { SendEmail } from "../../services/EmailService"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userRepository = AppDataSource.getRepository(UserEntity)

export const UserSignUp = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body

        // Ensure you are using body parsing middleware
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "User fields are required." });
        }
        // Check if user is already in the system
        const isUserExists = await userRepository.findOne({
            where: {
                email: email
            }
        })
        if (isUserExists) { return res.status(400).json({ success: false, message: "User already exists." }); }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = userRepository.create({
            username: username,
            email: email,
            password: hashedPassword,
            sign_up_date: new Date()
        })
        const saveUser = await userRepository.save(newUser)

        await SendEmail(email,"Welcome to LibMag", WelcomeMessage(username))
        return res.status(201).json({ success: true, message: "Signup success." })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "An error occurred." });
    }
}

export const UserLogin = async (req: Request, res: Response) => {
    try {
        const { userid, password } = req.body

        // Ensure you are using body parsing middleware
        if (!userid || !password) {
            return res.status(400).json({ success: false, message: "userid and password are required." });
        }
        // Check if user is already in the system with either username or email
        const isUserExists = await userRepository.findOne({
            select: { email: true, username: true, password: true, user_id: true, role: true }, where: {
                email: userid
            }
        }) || await userRepository.findOne({
            select: { email: true, username: true, password: true, user_id: true, role: true }, where: {
                username: userid
            }
        })
        if (!isUserExists) { return res.status(400).json({ success: false, message: "User does not exist." }); }

        // password match check
        const isHashedPassword = await bcrypt.compare(password, isUserExists.password)

        if (!isHashedPassword) { return res.status(400).json({ success: false, message: "wrong password or userid" }) }

        // create jwt token
        let user = { id: isUserExists.user_id, role: isUserExists.role }
        const token = jwt.sign(user, jwtSecretKey, { expiresIn: '30m' });

        return res.status(200).json({
            success: true,
            message: "Login Success",
            token: token
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred." });
    }
}