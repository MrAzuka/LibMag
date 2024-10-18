import { UserEntity } from "../../entity/UserEntity"
import { AppDataSource } from "../../data-source"
import { salt, jwtSecretKey } from "../../config"
import bcrypt from "bcrypt"

const userRepository = AppDataSource.getRepository(UserEntity)

interface IUser {
    username: string, 
    email:string, 
    password: string
    sign_up_date: Date
}



export const newMockUser = async() => {
   try {
    let hashedPassword: string = await bcrypt.hash("password", salt)
    let data: IUser = {username: "Test",
    email: "test@test.com",
    password: hashedPassword,
    sign_up_date: new Date()
}

    let createNew = userRepository.create(data)
    await userRepository.save(createNew)

    return data
   } catch (error) {
    console.log(error)
   }
}

export const deleteMockUser = async(email: string) => {
    try {
     await userRepository.delete({email: email})
    } catch (error) {
     console.log(error)
    }
 }