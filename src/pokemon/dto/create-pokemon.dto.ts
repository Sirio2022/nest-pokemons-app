import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator'

export class CreatePokemonDto {
  @IsString()
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  name!: string

  @IsInt()
  @IsPositive({ message: 'Number must be a positive integer' })
  @Min(1, { message: 'Number must be greater than 0' })
  no!: number
}
