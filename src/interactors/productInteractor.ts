import { IMailler } from "../interfaces/IMailer";
import { IMessageBroker } from "../interfaces/IMessageBroker";
import { IProductInteractor } from "../interfaces/IProductInteractor";
import { IProductRepository } from "../interfaces/IProductRepository";

export class ProductInteractor implements IProductInteractor {
  private repository: IProductRepository;
  private mailler: IMailler;
  private broker: IMessageBroker;

  constructor(
    repository: IProductRepository, 
    mailler: IMailler, 
    broker: IMessageBroker
  ) {
    this.repository = repository;
    this.mailler = mailler;
    this.broker = broker;
  }

  async createProduct(input: any) {
    const data = await this.repository.create(input);
    // do some checks
    await this.broker.NotifyToPromotionService(data);

    return data;
  }

  async updateStock(id: string, stock: number) {
    const data = await this.repository.update(id, stock);
    await this.mailler.SendEmail("someone@someone.com", data);
    
    return data;
  }

  async getProducts(limit: number, offset: number) {
    return this.repository.find(limit, offset);
  }
}
