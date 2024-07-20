import { Category, Task } from "../types/User";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AddTaskButton, Container, StyledInput } from "../styles";
import {
  AddTaskRounded,
  CancelRounded,
  ConstructionOutlined,
} from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import {
  DESCRIPTION_MAX_LENGTH,
  TASK_NAME_MAX_LENGTH,
} from "../components/constants/constants";
// import {
//   CategorySelect,
//   ColorPicker,
// } from "../components";
import { TopBar } from "../components/top-bar/TopBar";
import { useUser } from "../contexts/UserContextProvider";
import { useStorageState } from "../hooks/useStorageState";
import { createTask } from "../apis/api";

const AddTask = () => {
  const { user, setUser } = useUser();
  const [name, setName] = useStorageState<string>("", "name", "sessionStorage");
  const [emoji, setEmoji] = useStorageState<string | null>(
    null,
    "emoji",
    "sessionStorage"
  );
  const [color, setColor] = useStorageState<string>(
    "white",
    "color",
    "sessionStorage"
  );
  const [description, setDescription] = useStorageState<string>(
    "",
    "description",
    "sessionStorage"
  );
  const [deadline, setDeadline] = useStorageState<string>(
    "",
    "deadline",
    "sessionStorage"
  );
  const [nameError, setNameError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useStorageState<
    Category[]
  >([], "categories", "sessionStorage");

  const n = useNavigate();

  useEffect(() => {
    document.title = "Todo App - Add Task";
  }, []);

  useEffect(() => {
    if (name.length > TASK_NAME_MAX_LENGTH) {
      setNameError(
        `Name should be less than or equal to ${TASK_NAME_MAX_LENGTH} characters`
      );
    } else {
      setNameError("");
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(
        `Description should be less than or equal to ${DESCRIPTION_MAX_LENGTH} characters`
      );
    } else {
      setDescriptionError("");
    }
  }, [description.length, name.length]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setName(newName);
    if (newName.length > TASK_NAME_MAX_LENGTH) {
      setNameError(
        `Name should be less than or equal to ${TASK_NAME_MAX_LENGTH} characters`
      );
    } else {
      setNameError("");
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDescription = event.target.value;
    setDescription(newDescription);
    if (newDescription.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(
        `Description should be less than or equal to ${DESCRIPTION_MAX_LENGTH} characters`
      );
    } else {
      setDescriptionError("");
    }
  };

  const handleDeadlineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(event.target.value);
  };

  const handleAddTask = async () => {
    if (name === "") {
      return;
    }

    if (nameError !== "" || descriptionError !== "") {
      return; // Do not add the task if the name or description exceeds the maximum length
    }

    const simplifiedCategories = selectedCategories.map(({ id, name }) => ({
      name,
    }));

    const response = await createTask({
      name,
      description: description !== "" ? description : undefined,
      date: new Date().toISOString().split("T")[0], // Convert to YYYY-MM-DD format
      // deadline: new Date("2024-08-01").toISOString().split("T")[0], // Convert to YYYY-MM-DD format
      deadline:
        deadline !== ""
          ? new Date(deadline).toISOString().split("T")[0]
          : undefined,
      completed: false,
      categories: [],
    });

    if (!response) {
      return;
    }

    const newTask: Task = {
      id: response?.id,
      done: false,
      pinned: false,
      completed: false,
      name,
      description: description !== "" ? description : undefined,
      color: "#88c9f2",
      date: new Date(response.date),
      deadline: deadline !== "" ? new Date(deadline) : undefined,
      category: selectedCategories ? selectedCategories : [],
    };

    // const response = await createTask({
    //   name: "task 2",
    //   description: "say hello",
    //   completed: false,

    //   date: new Date().toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    //   deadline: new Date("2024-08-01").toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    // });

    setUser((prevUser) => ({
      ...prevUser,
      tasks: [...prevUser.tasks, newTask],
    }));

    n("/");

    const itemsToRemove = [
      "name",
      "color",
      "description",
      "emoji",
      "deadline",
      "categories",
    ];
    itemsToRemove.map((item) => sessionStorage.removeItem(item));
  };

  return (
    <>
      <TopBar title="Add New Task" />
      <Container>
        <StyledInput
          label="Task Name"
          name="name"
          placeholder="Enter task name"
          autoComplete="off"
          value={name}
          onChange={handleNameChange}
          focused
          required
          error={nameError !== ""}
          helpercolor={"red"}
          helperText={
            name === ""
              ? undefined
              : !nameError
              ? `${name.length}/${TASK_NAME_MAX_LENGTH}`
              : nameError
          }
        />
        <StyledInput
          label="Task Description (optional)"
          name="name"
          placeholder="Enter task description"
          autoComplete="off"
          value={description}
          onChange={handleDescriptionChange}
          multiline
          rows={4}
          focused
          error={descriptionError !== ""}
          helpercolor={descriptionError && "red"}
          helperText={
            description === ""
              ? undefined
              : !descriptionError
              ? `${description.length}/${DESCRIPTION_MAX_LENGTH}`
              : descriptionError
          }
        />
        <StyledInput
          label="Task Deadline (optional)"
          name="name"
          placeholder="Enter deadline date"
          type="datetime-local"
          value={deadline}
          onChange={handleDeadlineChange}
          focused
          sx={{
            colorScheme: "light",
          }}
          InputProps={{
            startAdornment:
              deadline && deadline !== "" ? (
                <InputAdornment position="start">
                  <Tooltip title="Clear">
                    <IconButton color="error" onClick={() => setDeadline("")}>
                      <CancelRounded />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : undefined,
          }}
        />
        {
          <div style={{ marginBottom: "14px" }}>
            <br />
            {/* <CategorySelect
                selectedCategories={selectedCategories}
                onCategoryChange={(categories) =>
                  setSelectedCategories(categories)
                }
                width="400px"
                fontColor={getFontColor(theme.secondary)}
              /> */}
          </div>
        }

        <AddTaskButton
          onClick={handleAddTask}
          disabled={
            name.length > TASK_NAME_MAX_LENGTH ||
            description.length > DESCRIPTION_MAX_LENGTH
          }
        >
          Create Task
        </AddTaskButton>
      </Container>
    </>
  );
};

export default AddTask;
