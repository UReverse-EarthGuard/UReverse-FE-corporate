import ProductImages from '../common/ProductImages';
import ProductDetails from '../common/ProductDetails';
import AiInspectionResult from '../common/AiInspectionResult';
import InspectionCriteria from '../common/InspectionCriteria';
import HumanInspectionResult from './HumanInspectionResult';

export default function ProductInfoSection({ product, showHumanResult = true }) {

  return (
    <section>
      <ProductImages imageUrls={product.imageUrls} />
      <ProductDetails product={product} />
      <AiInspectionResult ai={product.aiInspection} />
      <InspectionCriteria />
      { showHumanResult && (
        <HumanInspectionResult human={product.humanInspection} />
      )}
    </section>
  );
}
