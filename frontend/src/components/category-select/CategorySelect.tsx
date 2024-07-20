import styled from "@emotion/styled";
import {
  AddRounded,
  EditRounded,
  ExpandMoreRounded,
  RadioButtonChecked,
} from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import { CSSProperties, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { MAX_CATEGORIES_IN_TASK } from "../constants/constants";
import { useUser } from "../../contexts/UserContextProvider";
import type { Category, UUID } from "../../types/User";

interface CategorySelectProps {
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
  width?: CSSProperties["width"];
  fontColor?: CSSProperties["color"];
}

/**
 * Component for selecting categories with emojis.
 */
export const CategorySelect: React.FC<CategorySelectProps> = ({
  selectedCategories,
  onCategoryChange,
  width,
  fontColor,
}) => {
  const { user } = useUser();
  const { categories } = user;
  const [selectedCats, setSelectedCats] =
    useState<Category[]>(selectedCategories);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const n = useNavigate();

  const handleCategoryChange = (event: SelectChangeEvent<unknown>): void => {
    const selectedCategoryIds = event.target.value as UUID[];
    if (selectedCategoryIds.length > MAX_CATEGORIES_IN_TASK) {
      return;
    }
    const selectedCategories = categories.filter((cat) =>
      selectedCategoryIds.includes(cat.id)
    );
    setSelectedCats(selectedCategories);
    onCategoryChange && onCategoryChange(selectedCategories);
  };

  return (
    <FormControl sx={{ width: width || "100%" }}>
      <FormLabel
        sx={{
          color: "black",
          marginLeft: "8px",
          fontWeight: 500,
        }}
      >
        Category
      </FormLabel>

      <StyledSelect
        multiple
        width={width}
        value={selectedCats.map((cat) => cat.id)}
        onChange={handleCategoryChange}
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        IconComponent={() => (
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <ExpandMoreRounded
              sx={{
                marginRight: "14px",
                color: "rebeccapurple",
                transform: isOpen ? "rotate(180deg)" : "none",
              }}
            />
          </Box>
        )}
        renderValue={() => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px 8px" }}>
            {/* {selectedCats.map((category) => (
              <CategoryBadge
                key={category.id}
                category={category}
                sx={{ cursor: "pointer" }}
                glow={false}
              />
            ))} */}
          </Box>
        )}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 450,
              zIndex: 999999,
              padding: "0px 8px",
            },
          },
        }}
      >
        <HeaderMenuItem disabled>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <b>
              Select Categories{" "}
              <span
                style={{
                  transition: ".3s color",
                  color:
                    selectedCats.length >= MAX_CATEGORIES_IN_TASK
                      ? "#f34141"
                      : "currentcolor",
                }}
              >
                {categories.length > 3 && (
                  <span>(max {MAX_CATEGORIES_IN_TASK})</span>
                )}
              </span>
            </b>
            {selectedCats.length > 0 && (
              <SelectedNames>
                Selected:{" "}
                {selectedCats.length > 0 &&
                  new Intl.ListFormat("en", {
                    style: "long",
                    type: "conjunction",
                  }).format(selectedCats.map((category) => category.name))}
              </SelectedNames>
            )}
          </div>
        </HeaderMenuItem>
        {categories && categories.length > 0 && (
          <div style={{ margin: "8px", marginBottom: "16px" }}>
            <Link to="/categories">
              <Button fullWidth variant="outlined">
                <EditRounded /> &nbsp; Modify Categories
              </Button>
            </Link>
          </div>
        )}
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <CategoriesMenu
              key={category.id}
              value={category.id}
              clr={category.color}
              translate="no"
              disable={
                selectedCats.length >= MAX_CATEGORIES_IN_TASK &&
                !selectedCats.some((cat) => cat.id === category.id)
              }
            >
              {selectedCats.some((cat) => cat.id === category.id) && (
                <RadioButtonChecked />
              )}

              {category.name}
            </CategoriesMenu>
          ))
        ) : (
          <NoCategories disableTouchRipple>
            <p>You don't have any categories</p>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                n("/categories");
              }}
            >
              <AddRounded /> &nbsp; Add Category
            </Button>
          </NoCategories>
        )}
      </StyledSelect>
    </FormControl>
  );
};

const StyledSelect = styled(Select)<{ width?: CSSProperties["width"] }>`
  margin: 12px 0;
  border-radius: 16px !important;
  transition: 0.3s all;
  width: ${({ width }) => width || "100%"};
  color: white;
  background: #ffffff18;
  z-index: 999;
`;

const CategoriesMenu = styled(MenuItem)<{ clr: string; disable?: boolean }>`
  padding: 12px 16px;
  border-radius: 16px;
  margin: 8px;
  display: flex;
  gap: 4px;
  font-weight: 600;
  transition: 0.2s all;
  color: black;
  background: ${({ clr }) => clr};
  opacity: ${({ disable }) => (disable ? ".6" : "none")};
  &:hover {
    background: ${({ clr }) => clr};
    opacity: ${({ disable }) => (disable ? "none" : ".8")};
  }

  &:focus {
    opacity: none;
  }

  &:focus-visible {
    border-color: black !important;
  }

  &.Mui-selected {
    background: ${({ clr }) => clr};
    color: black;
    display: flex;
    justify-content: left;
    align-items: center;
    font-weight: 800;
    &:hover {
      background: ${({ clr }) => clr};
      opacity: 0.7;
    }
  }
`;

const HeaderMenuItem = styled(MenuItem)`
  opacity: 1 !important;
  font-weight: 500;
  position: sticky !important;
  top: 0;
  backdrop-filter: blur(6px);
  z-index: 99;
  pointer-events: none !important;
  cursor: default !important;
  background: "#ffffffc3";
`;

const SelectedNames = styled.span`
  opacity: 0.9;
  font-size: 15px;
  word-break: break-all;
  max-width: 300px;
`;

const NoCategories = styled(MenuItem)`
  opacity: 1 !important;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 12px 0;
  gap: 6px;
  cursor: default !important;
  & p {
    margin: 20px 0 32px 0;
  }
  &:hover {
    background: transparent !important;
  }
`;
