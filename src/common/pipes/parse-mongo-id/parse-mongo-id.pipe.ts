import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid MongoId: ${value}`)
    }
    return value
  }
}
