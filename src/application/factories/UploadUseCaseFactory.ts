import { DeleteFileUseCase } from "../use-cases/upload/DeleteFileUseCase";
import { UploadFileUseCase } from "../use-cases/upload/UploadFileUseCase";
import { DatabaseFactory } from "./DatabaseFactory";

export class UploadUseCaseFactory {
  static create() {
    const fileRepository = DatabaseFactory.getFileRepository();

    return {
      uploadFile: new UploadFileUseCase(fileRepository),
      deleteFile: new DeleteFileUseCase(fileRepository),
    };
  }
}
