import { Controller, Get, Header, HttpException, HttpStatus, Injectable, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, isValidObjectId, Model } from 'mongoose';
import { Cat, CatDocument } from './schemas/cat.schema';
import { mongo } from "mongoose"
import { FileInterceptor } from '@nestjs/platform-express';
import { MongoGridFS } from 'mongo-gridfs'
import { GridFSBucket } from 'mongodb';
import * as fs from 'fs';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {

  private fileModel: MongoGridFS;
  private bucket;
  constructor(
    @InjectModel(Cat.name) private readonly catModel: Model<CatDocument>,
    @InjectConnection() private readonly connection,
    private filesService: CatsService
  ) {
    this.fileModel = new MongoGridFS(this.connection.db, 'fs');
    this.bucket = new mongo.GridFSBucket(connection.db, { bucketName: 'fs' })
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file,
  ) {
    console.log(file);
  }

  async fileDown(id) {
    await this.fileModel.readFileStream(id)
    const downloadStream = this.bucket.openDownloadStream(id)
    return new Promise(resolve => {
      resolve(downloadStream)
    });
  }

  @Get("download/:id")
  async downloadFile(@Param('id') id: string, @Res() res) {
    const file = await this.filesService.findInfo(id)
    const filestream = await this.filesService.readStream(id)
    if (!filestream) {
      throw new HttpException('An error occurred while retrieving file', HttpStatus.EXPECTATION_FAILED)
    }
    res.header('Content-Type', file.contentType);
    res.header('Content-Disposition', 'attachment; filename=' + file.filename);
    return filestream.pipe(res)
  }
}