import express from "express";
import {
  ProductController,
} from "../controllers/ProductController";
import { ProductRepository } from "../repositories/productRepository";
import { ProductInteractor } from "../interactors/productInteractor";
import { Mailler } from "../libs/mailer";
import { MessageBroker } from "../libs/messageBroker";

const repository = new ProductRepository();
const mailer = new Mailler();
const broker = new MessageBroker();
const interactor = new ProductInteractor(repository, mailer, broker);


const controller = new ProductController(interactor);

const router = express.Router();

router.post("/products", controller.onCreateProduct.bind(controller));
router.get("/products", controller.onGetProducts.bind(controller));
router.patch("/products/:id", controller.onUpdateStock.bind(controller));

export default router;
