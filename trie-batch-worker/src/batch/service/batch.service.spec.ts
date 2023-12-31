import { MysqlWordRepository } from '../repository/implemnetation/mysql-word.repository';
import { CacheWordService } from './cache-word/cache-word.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheMapWordService } from './cache-word/implementation/cache-map-word.service';
import { BatchService } from './batch.service';
import { Word } from '../entity/word.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordRepository } from '../repository/word.repository';
export class MockWordRepositroy implements WordRepository {
  storage: Word[] = [];
  async batchWords(words: Word[]): Promise<void> {
    words.forEach((word) => this.storage.push(word));
  }
  async findWordByKorean(korean: string): Promise<Word> {
    return this.storage.find((word) => word.korean == korean);
  }
  async saveWord(word: Word): Promise<void> {
    this.storage.push(word);
  }
}
describe('BatchService', () => {
  let CacheWordService: CacheWordService;
  let wordRepository: MockWordRepositroy;
  let batchService: BatchService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: 'CacheWordService', useClass: CacheMapWordService },
        { provide: 'WordRepository', useClass: MockWordRepositroy },
      ],
    }).compile();
    batchService = module.get<BatchService>(BatchService);
    CacheWordService = module.get<CacheMapWordService>('CacheWordService');
    wordRepository = module.get<MockWordRepositroy>('WordRepository');
  });

  describe('migratedNewWordsToRepository', () => {
    it('trackedWord를 전부 reposiotry로 업데이트', async () => {
      const newWord1 = new Word('안녕1', 'hello1');
      const newWord2 = new Word('안녕2', 'hello2');
      const newWord3 = new Word('안녕3', 'hello3');

      await CacheWordService.trackWord(newWord1);
      await CacheWordService.trackWord(newWord2);
      await CacheWordService.trackWord(newWord3);

      await batchService.migrateNewWordsToRepository();

      expect(await wordRepository.findWordByKorean('안녕1')).toEqual(newWord1);
      expect(await wordRepository.findWordByKorean('안녕2')).toEqual(newWord2);
      expect(await wordRepository.findWordByKorean('안녕3')).toEqual(newWord3);
    });
  });
});
