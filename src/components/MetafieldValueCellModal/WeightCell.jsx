import React, { useCallback, useState } from "react";
import {
  ActionList,
  Button,
  ButtonGroup,
  InlineError,
  Popover,
  TextField,
} from "@shopify/polaris";

function WeightCell({ onSetValue, value, error }) {
  const weight = value ? JSON.parse(value) : {value: "",unit: ""};
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const handleChangeWeight = (key, value) => {
    onSetValue(JSON.stringify({...weight, [key]: value}))
  }
  const activator = (
    <Button onClick={toggleActive} disclosure>
      {weight ? weight.unit : "Choose unit"}
    </Button>
  );
  const listUnit = [
    {
      unit: "Ounce",
      id: "oz",
    },
    {
      unit: "Pound",
      id: "lb",
    },
    {
      unit: "Gram",
      id: "g",
    },
    {
      unit: "Kilogram",
      id: "kg",
    },
  ];
  const listUnitMarkup = listUnit.map((item) => ({
    content: item.id,
    suffix: item.unit,
    onAction() {
      setActive(false);
      handleChangeWeight("unit",item.id)
    },
  }));
  return (
    <>
      <ButtonGroup fullWidth>
        <div style={{ maxWidth: "120px" }}>
          <TextField
            step={0.1}
            type="number"
            value={weight?.value ? weight.value.toString() : ""}
            onChange={(value) => handleChangeWeight("value",value)}
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

export default WeightCell;
