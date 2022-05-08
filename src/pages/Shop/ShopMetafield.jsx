import { useMutation, useQuery } from "@apollo/client";
import { useHistory } from 'react-router-dom';
import { Loading } from "@shopify/app-bridge-react";
import {
    Button,
    Card,
    Icon,
    IndexTable,
    Page, Tabs,
    Toast
} from "@shopify/polaris";
import { ViewMajor } from "@shopify/polaris-icons";
import React, { useEffect, useRef, useState } from "react";
import AddMetafieldModal from "../../components/AddMetafieldModal";
import MetafieldRow from "../../components/MetafieldRow";
import {
    CREATE_METAFIELD,
    DELETE_METAFIELD,
    GET_SHOP_INFO, UPDATE_SHOP_METAFIELD
} from "../../gql";

function ShopMetafield(props) {
  const history = useHistory()
  const [skip, setSkip] = useState(false);
  const [metafieldsList, setMetafieldsList] = useState([]);
  const [shopInfo, setShopInfo] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [activeToast, setActiveToast] = useState(false);
  const [toast, setToast] = useState({
    active: false,
    content: '',
    error: false,
  })
  const currentMetafieldList = useRef()

  const {loading, data, refetch} = useQuery(GET_SHOP_INFO, {skip});
  const [deleteMetafield, {}] = useMutation(DELETE_METAFIELD);
  const [updateShopMetafield, {}] = useMutation(UPDATE_SHOP_METAFIELD);
  const [createMetafield, {}] = useMutation(CREATE_METAFIELD);


  ;
  useEffect(() => {
    if (!loading && !!data) {
      setSkip(true);
      const metafieldsListData =
      data && data?.shop.metafields.edges.map((item) => item.node);
      currentMetafieldList.current = metafieldsListData;
      setMetafieldsList(metafieldsListData);
      setShopInfo({
        id: data.shop.id,
        name: data.shop.name,
        url: data.shop.url,
      });
    }
  }, [loading,data ]);
  const handleChangeMetafield = (newValue, id) => {
    const metafieldChanged = metafieldsList.find((x) => x.id === id);
    const indexOfMetafieldChanged = metafieldsList.findIndex(
      (x) => x.id === id
    );
    const newMetafieldAfterChanged = { ...metafieldChanged, value: newValue };
    const newMetafieldsList = [...metafieldsList];
    newMetafieldsList[indexOfMetafieldChanged] = newMetafieldAfterChanged;
    setMetafieldsList(newMetafieldsList);
  };

  const handleDeleteMetafield = async (id) => {
    try {
      const newMetafieldsList = metafieldsList.filter((x) => x.id !== id);
      await deleteMetafield({
        variables: {
          input: {
            id,
          },
        },
      });
      setMetafieldsList(newMetafieldsList);
      console.log("Delete successfully");
    } catch (error) {
      setActiveToast(true);
      console.log("Failed to delete:", error);
    }
  };
  const handleSaveMetafield = async (item) => {
    try {
      console.log("start to save");
      const cloneItem = { ...item };
      delete cloneItem.__typename;
      delete cloneItem.id;
      console.log("data send:", {
        ...cloneItem,
        ownerId: shopInfo.id,
      });
      const data = await updateShopMetafield({
        variables: {
          metafields: [
            {
              ...cloneItem,
              ownerId: shopInfo.id,
            },
          ],
        },
      });
      console.log(data)
      if(data.data.metafieldsSet.userErrors.length > 0) {
        setToast({active: true, content:data.data.metafieldsSet.metafields.userErrors[0].message, error: true})
        return;
      }
      console.log("update sucessfully:", data);
      const {id, key, namespace, type, value} = data.data.metafieldsSet.metafields[0]
      const indexOfMetafieldUpdated = currentMetafieldList.current.findIndex(x => x.id === id)
      currentMetafieldList.current[indexOfMetafieldUpdated] = {id, key, namespace, type, value};
      setMetafieldsList(prev => {
        const index = prev.findIndex(x => x.id === id )
        prev[index] = {id, key, namespace, type, value}
        return prev
      })
      //   currentMetafieldList.current = metafieldsListUpdated;
    } catch (error) {
      console.log("Failed to update:", error);
    }
  };

  const handleAddMetafield = async (dataObj) => {
    try {
      console.log("add metafield, data send:",dataObj);
      const dataAdded = await createMetafield({
        variables: {
          metafields: [dataObj]
        }
      })
      if(dataAdded.data.metafieldsSet.userErrors.length > 0) {
        setToast({active: true, content:dataAdded.data.metafieldsSet.userErrors[0].message, error: true })
        return
      }
      const {id, key, namespace, type, value} = dataAdded.data.metafieldsSet.metafields[0]
      currentMetafieldList.current = [...metafieldsList, {id, key, namespace, type, value}]
      setMetafieldsList(prev =>{
        prev.push({id, key, namespace, type, value})
        return prev
      })
      setToast({active: true, content:'Add new metafield successfully', error: false })

    } catch (error) {
      console.log("failed to add new metafield:",error)
    }
  };

  if (loading) return <Loading />;
  return (
    //   <div>Shop</div>
    <Page
      breadcrumbs={[{content:'Back', onAction: () => history.push("/")}]}
      title={shopInfo?.name?.toUpperCase() || ""}
      subtitle="Add/Edit/Remove metafields"
      primaryAction={
        <Button primary onClick={() => setOpenModal(!openModal)} c>
          Create meta fields
        </Button>
      }
      secondaryActions={[
        {
          content: "Preview",
          accessibilityLabel: "Preview Shop",
          onAction: () => alert("Preview shop"),
          icon: () => <Icon source={ViewMajor} color="base" />,
        },
      ]}
    >
      <AddMetafieldModal
        ownerId={shopInfo.id}
        openModal={openModal}
        setOpenModal={setOpenModal}
        onAddMetafield={handleAddMetafield}
      />
      <Card>
        <Tabs
          tabs={[
            {
              id: "shop-metafields",
              content: `Shop ${shopInfo?.name?.toUpperCase() || ""} Metafields`,
              accessibilityLabel: "Shop",
              panelID: "shop-metafields",
            },
          ]}
          selected={0}
          onSelect={() => console.log("123")}
        >
          <Card.Section>
            <IndexTable
              resourceName={{ singular: "metafield", plural: "metafields" }}
              itemCount={3}
              headings={[
                { title: "Namespace" },
                { title: "Key" },
                { title: "Value" },
                { title: "Actions" },
              ]}
              selectable={false}
            >
              {metafieldsList.length > 0 &&
                metafieldsList.map((metafield, index) => {
                  return (
                    <MetafieldRow
                      key={index}
                      index={index}
                      currentItem={currentMetafieldList.current.find(
                        (x) => x.id === metafield.id
                      )}
                      item={metafield}
                      onDeleteMetafield={handleDeleteMetafield}
                      onChangeMetafield={handleChangeMetafield}
                      onSaveMetafield={handleSaveMetafield}
                    />
                  );
                })}
            </IndexTable>
          </Card.Section>
        </Tabs>
      </Card>
      {toast.active ? (
        <Toast
          error={toast.error}
          content={toast.content}
          duration="4000"
          onDismiss={() => setToast({active: false, content:'', error: false})}
        />
      ) : null}
    </Page>
  );
}

export default React.memo(ShopMetafield);
