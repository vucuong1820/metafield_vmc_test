import React, { useCallback, useState } from "react";
import {
  ActionList,
  Button,
  ButtonGroup,
  InlineError,
  Popover,
  TextField,
} from "@shopify/polaris";

function DimensionCellModal({ onSetValue, value, error }) {
  const dimension = value ? JSON.parse(value) : {value: "",unit: ""};
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const handleChangeDimension = (key, value) => {
    onSetValue(JSON.stringify({...dimension, [key]: value}))
  }
  const activator = (
    <Button onClick={toggleActive} disclosure>
      {dimension ? dimension.unit : "Choose unit"}
    </Button>
  );
  const listUnit = [
    {
      unit: "inches",
      id: "in",
    },
    {
      unit: "feet",
      id: "ft",
    },
    {
      unit: "yards",
      id: "yd",
    },
    {
      unit: "milliliters",
      id: "mm",
    },
    {
      unit: "centimeters",
      id: "cm",
    },
    {
      unit: "meters",
      id: "m",
    },
  ];
  const listUnitMarkup = listUnit.map((item) => ({
    content: item.id,
    suffix: item.unit,
    onAction() {
      setActive(false);
      handleChangeDimension("unit",item.id)
    },
  }));
  return (
    <>
      <ButtonGroup fullWidth>
        <div style={{ maxWidth: "120px" }}>
          <TextField
            step={0.1}
            type="number"
            value={dimension?.value ? dimension.value.toString() : ""}
            onChange={(value) => handleChangeDimension("value",value)}
          />
        </div>
        <Popover
          active={active}
          activator={activator}
          autofocusTarget="first-node"
          onClose={toggleActive}
        >
          <div style={{ maxHeight: "280px" }}>
            <ActionList
              actionRole="menuitem"
              sections={[
                {
                  items: listUnitMarkup,
                },
              ]}
            />
          </div>
        </Popover>
      </ButtonGroup>
      <InlineError message={error || ""} />
    </>
  );
}

export default DimensionCellModal;
