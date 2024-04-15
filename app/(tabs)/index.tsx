import { ActivityIndicator, Button, FlatList, ListRenderItem, StyleSheet } from "react-native";

import { Text, View } from "../../components/Themed";
import { Todo, createTodo, deleteTodo, getTodos, updateTodo } from "../../api/todos";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function TabOneScreen() {
  const [todo, setTodo] = useState("");
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });
  const { isLoading, isError, data } = todosQuery;

  const addMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateQueryClient = (updatedTodo: Todo) => {
    queryClient.setQueryData(["todos"], (data: any) => {
      return data.map((todo: Todo) => (todo.id === updatedTodo.id ? updatedTodo : todo));
    });
  };

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: updateQueryClient,
  });

  const addTodo = () => {
    addMutation.mutate(todo);
  };

  const renderTodo: ListRenderItem<Todo> = ({ item }) => {
    const deleteTodo = () => {
      deleteMutation.mutate(item.id);
    };

    const toggleDone = () => {
      updateMutation.mutate({ ...item, done: !item.done });
    };

    return (
      <View style={styles.todoContainer}>
        <TouchableOpacity style={styles.todo} onPress={toggleDone}>
          {item.done && <Ionicons name="checkmark-circle" size={24} color="green" />}
          {!item.done && <Ionicons name="checkmark-circle-outline" size={24} color="black" />}
        </TouchableOpacity>
        <Text style={styles.todoText}>{item.text}</Text>
        <Ionicons name="trash" size={24} color={"red"} onPress={deleteTodo} />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          placeholder="Add Todo"
          onChangeText={setTodo}
          value={todo}
          style={styles.textInputStyle}
        />
        <Button title="Add" onPress={addTodo} />
      </View>
      {isLoading ? <ActivityIndicator size="large" /> : null}
      {isError ? <Text>Couldn't load todos </Text> : null}
      <FlatList data={data} renderItem={renderTodo} keyExtractor={(item) => item.id.toString()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
    marginVertical: 4,
    backgroundColor: "#fff",
  },
  todo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  todoText: {
    flex: 1,
    // width: "80%",
    // paddingHorizontal: 50,
    // backgroundColor: "blue",
  },
  form: {
    flexDirection: "row",
    marginVertical: 20,
    alignItems: "center",
  },
  textInputStyle: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: "#fff",
  },
});
