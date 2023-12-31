import { Repository, DataSource } from 'typeorm';
import { Word } from '../../entity/word.entity';
import { WordRepository } from '../word.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MysqlWordRepository
  extends Repository<Word>
  implements WordRepository
{
  constructor(private dataSource: DataSource) {
    super(Word, dataSource.createEntityManager());
  }

  public async batchWords(words: Word[]): Promise<void> {
    await this.save(words);
  }
  public async findWordByKorean(korean: string): Promise<Word> {
    return await this.findOne({ where: { korean: korean } });
  }
  public async saveWord(word: Word): Promise<void> {
    await this.save(word);
  }
}
