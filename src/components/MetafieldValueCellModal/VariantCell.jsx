import { useQuery } from "@apollo/client";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { Avatar, Button, InlineError } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { GET_PRODUCT_BY_ID, GET_VARIANT_BY_ID } from "../../gql";

function VariantCell({ onSetValue, value, error }) {
  const [variant, setVariant] = useState({});
  const [skip, setSkip] = React.useState(false);
  //   const [product, setProduct] = useState({});
  //   const [sourceAvatar, setSourceAvatar] = useState("")
  const { loading, data } = useQuery(GET_VARIANT_BY_ID, {
    variables: { id: value },
    skip,
  });
  useEffect(() => {
    if (!loading && !!data) {
      setSkip(true);
      setVariant(data.productVariant);
    }
  }, [data, loading]);
  const [openPicker, setOpenPicker] = useState(false);
  const handleOpen = () => {
    setOpenPicker(true);
  };
  return (
    <>
      <Button
        fullWidth
        icon={<Avatar customer source={variant?.image || ""} />}
        disclosure="select"
        onClick={handleOpen}
      >
        {variant?.displayName || "Choose your variant"}
      </Button>
      <ResourcePicker // Resource picker component
        resourceType="ProductVariant"
        allowMultiple={false}
        showVariants={false}
        open={openPicker}
        onSelection={(resources) => {
          // setProduct(resources);
          //   setOpenPicker(false);
          console.log(resources);
          setVariant(resources.selection[0]);
          onSetValue(resources.selection[0].id);
          setOpenPicker(false);
          // onSetValue(resources);
          //   setSourceAvatar(resources.selection[0].images[0].originalSrc)
          //   onSetValue(resources.selection[0].id)
        }}
        onCancel={() => setOpenPicker(false)}
      />
      <InlineError message={error || ""} />
    </>
  );
}

export default VariantCell;
