import { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import uuid from "react-native-uuid";
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp } from "firebase/app";
import Keyboard from "../Keyboard";
import { duplicateArray, randomNumber } from "../../utils";
import { colors, CLEAR, ENTER } from "../../constants";
import EndScreen from "../EndScreen";
import words from "../../words";
import styles from "./Game.styles";

let config = {
  apiKey: "AIzaSyDMbCM6ORoYYQVZoWYxVySFBw3hWMCIVb8",
  authDomain: "guessandmatch.firebaseapp.com",
  projectId: "guessandmatch",
  storageBucket: "guessandmatch.appspot.com",
  messagingSenderId: "1077522634939",
  appId: "1:1077522634939:web:40219d75992ea8e607719e",
  measurementId: "G-QHGBKG90FL",
  databaseURL:
    "https://guessandmatch-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

initializeApp(config);

const NUMBER_OF_TRIES = 6;

const Game = () => {
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [word, setWord] = useState("");

  const letters = word?.split("");

  const [rows, setRows] = useState([[""], [""], [""], [""], [""], [""]]);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      if (!isConnected) {
        setWord(words[randomNumber(0, 4)]);
      }
    });
  }, []);

  useEffect(() => {
    if (isConnected) {
      getWords();
      setRows(
        new Array(NUMBER_OF_TRIES).fill(new Array(letters?.length).fill(""))
      );
    }
  }, [word]);

  useEffect(() => {
    if (gameState !== "playing") {
      saveState();
    }
  }, [gameState]);

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  const getWords = () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const starCountRef = ref(db, "words/word");
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        setWord(data[randomNumber(0, 4)]);
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log("Failed to receive words from DB", e);
    }
  };

  const saveState = async () => {
    const data = {
      rows,
      curRow,
      curCol,
      gameState,
    };

    try {
      const existingStateString = await AsyncStorage.getItem("@game");
      const existingState = existingStateString
        ? JSON.parse(existingStateString)
        : {};

      existingState[uuid.v4()] = data;

      const dataString = JSON.stringify(existingState);
      await AsyncStorage.setItem("@game", dataString);
    } catch (e) {
      console.log("Failed to write data", e);
    }
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState !== "won") {
      setGameState("won");
    } else if (checkIfLost() && gameState !== "lost") {
      setGameState("lost");
    }
  };

  const checkIfWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => {
    return !checkIfWon() && curRow === rows.length;
  };

  const onKeyPressed = (key) => {
    if (gameState !== "playing") {
      return;
    }
    const updatedRows = duplicateArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      if (curCol === rows[0].length) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }
      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
    return row == curRow && col == curCol;
  };

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];
    if (row >= curRow) {
      return colors.black;
    }
    if (letter === letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  };

  const greenKeys = getAllLettersWithColor(colors.primary);
  const yellowKeys = getAllLettersWithColor(colors.secondary);
  const greyKeys = getAllLettersWithColor(colors.darkgrey);

  if (gameState !== "playing") {
    return <EndScreen won={gameState === "won"} />;
  }

  return (
    !loading && (
      <>
        <ScrollView style={styles.map}>
          {rows.map((row, i) => (
            <View key={`row-${i}`} style={styles.row}>
              {row.map((letter, j) => (
                <View
                  key={`col-${j}`}
                  style={[
                    styles.cell,
                    {
                      borderColor: isCellActive(i, j)
                        ? colors.lightgrey
                        : colors.darkgrey,
                      backgroundColor: getCellBGColor(i, j),
                    },
                  ]}
                >
                  <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
        <Keyboard
          onKeyPressed={onKeyPressed}
          greenCaps={greenKeys}
          yellowCaps={yellowKeys}
          greyCaps={greyKeys}
        />
      </>
    )
  );
};

export default Game;
