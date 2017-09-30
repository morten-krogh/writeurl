WRITEURL_HOME ?= ${realpath .}
BUILD_DIR ?= ${WRITEURL_HOME}/build/release

# Library

SRC_DIR := ${WRITEURL_HOME}/src/writeurl

SRCS := ${shell find ${SRC_DIR} -name *.cpp}
OBJS := ${SRCS:${SRC_DIR}/%.cpp=${BUILD_DIR}/%.o}
DEPS := ${OBJS:.o=.d}

STATIC_LIB := ${BUILD_DIR}/libwriteurl.a

EXTERNAL := ${WRITEURL_HOME}/external
INC_FLAGS := -I${WRITEURL_HOME}/src -I${EXTERNAL}/catch/include \
	-I${EXTERNAL}/rapidjson/include -I${EXTERNAL}/spdlog/include

CPPFLAGS := ${INC_FLAGS} -MMD -MP
CXXFLAGS := -std=c++14 -Wall -Wextra -pedantic -Wunreachable-code \
-Wno-nested-anon-types -fno-elide-constructors -pthread

${BUILD_DIR}/%.o: ${SRC_DIR}/%.cpp
	${CXX} ${CPPFLAGS} ${CXXFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

${STATIC_LIB}: ${OBJS}
	${AR} -rcs $@  $^

# Main

WRITEURL_MAIN := ${BUILD_DIR}/writeurl  
WRITEURL_MAIN_SRC := ${WRITEURL_HOME}/src/main.cpp

${WRITEURL_MAIN}: ${STATIC_LIB} ${WRITEURL_MAIN_SRC}
	 ${CXX} ${CPPFLAGS} ${CXXFLAGS} ${EXTRA_CFLAGS} $^ -o $@

# Tests

TEST_BUILD_DIR ?= ${BUILD_DIR}/test
TEST_MAIN ?= ${TEST_BUILD_DIR}/main
TEST_SRC_DIR := ${WRITEURL_HOME}/test

TEST_SRCS := ${shell find ${TEST_SRC_DIR} -name *.cpp}
TEST_OBJS := ${TEST_SRCS:${TEST_SRC_DIR}/%.cpp=${TEST_BUILD_DIR}/%.o}
TEST_DEPS := ${TEST_OBJS:.o=.d}

TEST_CPPFLAGS := -I${TEST_SRC_DIR} ${CPPFLAGS}

TEST_LDFLAGS :=

${TEST_BUILD_DIR}/%.o: ${TEST_SRC_DIR}/%.cpp
	${CXX} ${TEST_CPPFLAGS} ${CXXFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

${TEST_MAIN}: ${STATIC_LIB} ${TEST_OBJS}
	${CXX} ${TEST_LDFLAGS} $^ -o $@

.PHONY: static_lib
static_lib: ${STATIC_LIB}

.PHONY: writeurl
writeurl: ${WRITEURL_MAIN}

.PHONY: test
test: ${TEST_MAIN}

.PHONY: objects
objects: ${OBJS}

.PHONY: clean
clean:
	${RM} ${STATIC_LIB}
	${RM} ${OBJS}
	${RM} ${DEPS}
	${RM} ${TEST_OBJS}
	${RM} ${TEST_DEPS}


all: static_lib test

-include $(DEPS)
-include ${TEST_DEPS}
