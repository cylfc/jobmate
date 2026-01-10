/**
 * Base Transformer
 * Abstract base class for data transformers
 */

export abstract class BaseTransformer<TBackend, TFrontend> {
  /**
   * Transform single backend entity to frontend format
   */
  abstract transform(backend: TBackend): TFrontend;

  /**
   * Transform array of backend entities to frontend format
   */
  transformMany(backend: TBackend[]): TFrontend[] {
    return backend.map((item) => this.transform(item));
  }
}
