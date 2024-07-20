import styled from "@emotion/styled";
import {
  Cancel,
  Close,
  ContentCopy,
  ContentCopyRounded,
  DeleteRounded,
  Done,
  DownloadRounded,
  EditRounded,
  IosShare,
  LaunchRounded,
  LinkRounded,
  Pause,
  PlayArrow,
  PushPinRounded,
  QrCode2Rounded,
  RadioButtonChecked,
  RecordVoiceOver,
  RecordVoiceOverRounded,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { useContext, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useUser } from "../../contexts/UserContextProvider";

import { DialogBtn } from "../../styles";
import { Task, UUID } from "../../types/User";

import { useTheme } from "@emotion/react";
import { useTasks } from "../../contexts/TaskContextProvider";
import { updateTask } from "../../apis/api";

export const TaskMenu = () => {
  const { user, setUser } = useUser();
  const { tasks, name } = user;
  const {
    selectedTaskId,
    anchorEl,
    anchorPosition,
    multipleSelectedTasks,
    handleSelectTask,
    setEditModalOpen,
    handleDeleteTask,
    handleCloseMoreMenu,
  } = useTasks();

  const selectedTask = useMemo(() => {
    return tasks.find((task) => task.id === selectedTaskId) || ({} as Task);
  }, [selectedTaskId, tasks]);

  const handleMarkAsDone = async () => {
    // Toggles the "done" property of the selected task

    try {
      if (selectedTaskId) {
        await updateTask(selectedTaskId, {
          name: selectedTask.name,
          description: selectedTask.description,
          completed: true,
          date: new Date(selectedTask.date).toISOString().split("T")[0],
          deadline:
            selectedTask.deadline !== undefined
              ? new Date(selectedTask.deadline).toISOString().split("T")[0]
              : undefined,
        });

        handleCloseMoreMenu();
        const updatedTasks = tasks.map((task) => {
          if (task.id === selectedTaskId) {
            return { ...task, done: !task.done };
          }
          return task;
        });
        setUser((prevUser) => ({
          ...prevUser,
          tasks: updatedTasks,
        }));

        const allTasksDone = updatedTasks.every((task) => task.done);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems: JSX.Element = (
    <div>
      <StyledMenuItem onClick={handleMarkAsDone}>
        {selectedTask.done ? <Close /> : <Done />}
        &nbsp; {selectedTask.done ? "Mark as not done" : "Mark as done"}
      </StyledMenuItem>

      {multipleSelectedTasks.length === 0 && (
        <StyledMenuItem
          onClick={() =>
            handleSelectTask(selectedTaskId || crypto.randomUUID())
          }
        >
          <RadioButtonChecked /> &nbsp; Select
        </StyledMenuItem>
      )}

      <Divider />
      <StyledMenuItem
        onClick={() => {
          setEditModalOpen(true);
          handleCloseMoreMenu();
        }}
      >
        <EditRounded /> &nbsp; Edit
      </StyledMenuItem>

      <Divider />
      <StyledMenuItem
        clr={"red"}
        onClick={() => {
          handleDeleteTask();
          handleCloseMoreMenu();
        }}
      >
        <DeleteRounded /> &nbsp; Delete
      </StyledMenuItem>
    </div>
  );

  return (
    <>
      <Menu
        id="task-menu"
        anchorEl={anchorEl}
        anchorPosition={anchorPosition ? anchorPosition : undefined}
        anchorReference={anchorPosition ? "anchorPosition" : undefined}
        open={Boolean(anchorEl)}
        onClose={handleCloseMoreMenu}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "18px",
            minWidth: "200px",
            boxShadow: "none",
            padding: "6px 4px",
          },
        }}
        MenuListProps={{
          "aria-labelledby": "more-button",
        }}
      >
        {menuItems}
      </Menu>
    </>
  );
};
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StyledMenuItem = styled(MenuItem)<{ clr?: string }>`
  margin: 0 6px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: none;
  gap: 2px;
  color: ${({ clr }) => clr || "unset"};
`;

const StyledTab = styled(Tab)`
  border-radius: 12px 12px 0 0;
  width: 50%;
  .MuiTabs-indicator {
    border-radius: 24px;
  }
`;
StyledTab.defaultProps = {
  iconPosition: "start",
};
