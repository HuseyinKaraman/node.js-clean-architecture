import {NextFunction, Request, Response} from 'express'
import { IProductInteractor } from '../interfaces/IProductInteractor'

export class ProductController {

  private interactor: IProductInteractor

  constructor(interactor: IProductInteractor) {
    this.interactor = interactor
  }

  async onCreateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      // TODO: validate logic here
      const data = await this.interactor.createProduct(body)
      
      res.status(201).json(data)
    } catch (error) {
      next(error);
    }
  }

  async onGetProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const offset = parseInt(`${req.query.offset}`) || 0;
      const limit = parseInt(`${req.query.limit}`) || 10;

      const data = await this.interactor.getProducts(limit, offset);
      res.status(200).json(data)
    } catch (error) {
      next(error);
    }
  }

  async onUpdateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const stock = req.body.stock;
      const data = await this.interactor.updateStock(id, stock);
      
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
};