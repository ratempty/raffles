import { Injectable } from '@nestjs/common';
import aws from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly s3;
  constructor() {
    aws.config.update({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    this.s3 = new aws.S3();
  }

  async uploadImage(file: Express.Multer.File) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const key = `${Date.now()}_${file.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      ACL: 'private',
      Key: key,
      Body: file.buffer,
    };
    return new Promise((resolve, reject) => {
      this.s3.putObject(params, (err, data) => {
        if (err) reject(err);
        resolve(key);
      });
    });
  }
}
