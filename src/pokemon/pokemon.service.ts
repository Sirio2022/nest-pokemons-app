import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, mongo, Types } from 'mongoose'
import { PaginationDto } from '../common/dto/pagination.dto'
import { CreatePokemonDto } from './dto/create-pokemon.dto'
import { UpdatePokemonDto } from './dto/update-pokemon.dto'
import { Pokemon } from './entities/pokemon.entity'

@Injectable()
export class PokemonService {
  private readonly defaultLimit: number

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = Number(this.configService.get('defaultLimit'))
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)

      return pokemon
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto

    return this.pokemonModel
      .find()
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ no: 1 })
      .select('-__v')
  }

  async findOne(id: string) {
    let pokemon: Pokemon | null = null

    // 1. Si es un ObjectId válido, buscamos directo por ID (es lo más rápido)
    if (Types.ObjectId.isValid(id)) {
      pokemon = await this.pokemonModel.findById(id)
    } else {
      // 2. Si no es un ID, buscamos por Name O por No en una Sola consulta inteligente
      pokemon = await this.pokemonModel.findOne({
        $or: [
          { name: id.toLocaleLowerCase().trim() },
          ...(Number.isNaN(+id) ? [] : [{ no: +id }]), // 💡 Solo mete el número al $or si de verdad es un número
        ],
      })
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${id}" not found`,
      )
    }

    return pokemon
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      // 💡 Reutilizamos tu findOne inteligente que ya busca por ID, Nombre o Número
      const pokemon = await this.findOne(id)

      // Si el usuario mandó el nombre, lo normalizamos antes de fusionar
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase().trim()
      }

      // Fusionamos los cambios del DTO en el pokémon que trajimos
      Object.assign(pokemon, updatePokemonDto)

      // Guardamos en la base de datos (disparando validaciones y hooks)
      return await pokemon.save()
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    // 1. Buscamos el pokemon (si no existe, lanza el 404 automáticamente)
    const pokemon = await this.findOne(id)

    // 💡 2. Le decimos al documento en memoria que se elimine de la DB
    await pokemon.deleteOne()

    // 3. Devolvemos un mensaje o el pokémon que acabamos de borrar
    return {
      message: `Pokemon ${pokemon.name} (No. ${pokemon.no}) successfully removed`,
    }
  }

  private handleExceptions(error: any) {
    // 💡 Validamos si el error es una instancia de un error de Mongo
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      throw new BadRequestException(
        `Can't create Pokemon"${JSON.stringify(error.keyValue)}" already exists`,
      )
    }

    throw new InternalServerErrorException(
      'Can’t create Pokemon - Check server logs',
    )
  }
}
