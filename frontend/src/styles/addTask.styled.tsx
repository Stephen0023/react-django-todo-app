import styled from "@emotion/styled";
import { Button, TextField } from "@mui/material";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const AddTaskButton = styled(Button)`
  margin-top: 4px;
  border: none;
  padding: 16px 32px;
  font-size: 24px;
  background: white;
  color: black;
  border-radius: 999px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s all;
  margin: 20px;
  width: 400px;
  text-transform: capitalize;
  &:hover {
    box-shadow: 0px 0px 24px 0px red;
    background: yellow;
  }
  &:disabled {
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.7;
    color: white;
  }
`;
export const StyledInput = styled(TextField)<{ helpercolor?: string }>`
  margin: 12px;
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    transition: 0.3s all;
    width: 400px;
    color: black;
  }
  .MuiFormHelperText-root {
    color: white;
    opacity: 0.8;
  }
`;
