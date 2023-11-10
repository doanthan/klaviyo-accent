import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { ITEM_LIST } from "data/items";

import Item from "components/Item";

const ItemPage = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);

  const item = ITEM_LIST.find((item) => item.ProductID === id);

  return <Item item={item} />;
};

export default ItemPage;
