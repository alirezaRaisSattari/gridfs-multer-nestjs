import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';
import { MulterModule } from '@nestjs/platform-express';
import { GridFsStorage } from 'multer-gridfs-storage';
import { GridFsMulterConfigService } from './gridfs-multer-config.service';


const storage = new GridFsStorage({ url: "mongodb://localhost:27017/test", })
@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  MulterModule.registerAsync({
    useClass: GridFsMulterConfigService,
  }),],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule { }
