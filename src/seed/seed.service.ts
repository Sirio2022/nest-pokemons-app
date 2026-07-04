import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AxiosAdapter } from '../common/adapters/axios.adapter'
import { Pokemon } from '../pokemon/entities/pokemon.entity'
import { PokeAPIResponse } from './interfaces/poke-response.interface'

@Injectable()
export class SeedService {
  constructor(
    // 1. Inyectamos el modelo de Pokemon para poder interactuar con la base de datos
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly httpAdapter: AxiosAdapter,
  ) {}

  async seedExecute() {
    // 2. Limpiamos la base de datos antes (opcional, pero recomendado para evitar errores de duplicados de ID si ejecutas el seed dos veces)
    await this.pokemonModel.deleteMany({})

    // 3. Obtenemos los datos de la API de Pokémon
    const data = await this.httpAdapter.get<PokeAPIResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=1000',
    )

    // 4. Mapeamos los resultados para obtener solo el número y el nombre de cada Pokémon
    const pokemonsToInsert = data.results.map(({ name, url }) => {
      const no = Number(url.split('/').findLast((segment) => !!segment))
      return { no, name }
    })

    // 5. Insertamos en lote (insertMany es ultra rápido porque hace una sola petición a MongoDB)
    const createdPokemons = await this.pokemonModel.insertMany(pokemonsToInsert)

    return {
      message: 'Seed executed successfully',
      createdCount: createdPokemons.length,
    }
  }
}
