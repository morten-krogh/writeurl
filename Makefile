WUL_HOME ?= ${realpath .}
BUILD_DIR ?= ${WUL_HOME}/build/release

# Library

SRC_DIR := ${WUL_HOME}/src/wul

SRCS := ${shell find ${SRC_DIR} -name '*.c'}
OBJS := ${SRCS:${SRC_DIR}/%.c=${BUILD_DIR}/%.o}
DEPS := ${OBJS:.o=.d}

LIB_WRITEURL := ${BUILD_DIR}/libwriteurl.a

EXTERNAL := ${WUL_HOME}/external
INC_FLAGS := -I${WUL_HOME}/src -I${EXTERNAL}/zf_log

CPPFLAGS := ${INC_FLAGS} -MMD -MP
CFLAGS := -std=c11 -Wall -Wextra -pedantic -Wunreachable-code \
	-Wno-nested-anon-types -fno-elide-constructors -pthread \
	-Wno-unused-parameter

${BUILD_DIR}/%.o: ${SRC_DIR}/%.c
	${CC} ${CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

# zf_log

ZF_LOG_DIR := ${EXTERNAL}/zf_log/zf_log
ZF_LOG_SRC := ${ZF_LOG_DIR}/zf_log.c
ZF_LOG_OBJ := ${BUILD_DIR}/zf_log.o

${ZF_LOG_OBJ}: ${ZF_LOG_SRC}
	${CC} ${CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

${LIB_WRITEURL}: ${OBJS} ${ZF_LOG_OBJ}
	${AR} -rcs $@  $^

# Main

WRITEURL_SERVER := ${BUILD_DIR}/writeurl-server
WRITEURL_SERVER_SRC := ${WUL_HOME}/src/main.c

WRITEURL_LDFLAGS :=

${WRITEURL_SERVER}: ${LIB_WRITEURL} ${WRITEURL_SERVER_SRC}
	${CC} ${CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} ${WRITEURL_LDFLAGS} ${EXTRA_LDFLAGS} $^ -o $@

# Tests

TEST_BUILD_DIR ?= ${BUILD_DIR}/test
TEST_MAIN ?= ${TEST_BUILD_DIR}/main
TEST_SRC_DIR := ${WUL_HOME}/test

TEST_SRCS := ${shell find ${TEST_SRC_DIR} -name '*.c'}
TEST_OBJS := ${TEST_SRCS:${TEST_SRC_DIR}/%.c=${TEST_BUILD_DIR}/%.o}
TEST_DEPS := ${TEST_OBJS:.o=.d}

TEST_CPPFLAGS := -I${TEST_SRC_DIR} ${CPPFLAGS}

TEST_LDFLAGS :=

${TEST_BUILD_DIR}:
	mkdir -p ${TEST_BUILD_DIR}

${TEST_BUILD_DIR}/%.o: ${TEST_SRC_DIR}/%.c
	${CC} ${TEST_CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

${TEST_MAIN}: ${TEST_BUILD_DIR} ${LIB_WRITEURL} ${TEST_OBJS}
	${CC} ${TEST_LDFLAGS} ${EXTRA_LDFLAGS} ${LIB_WRITEURL} ${TEST_OBJS} -o $@

.PHONY: libwriteurl
libwriteurl: ${LIB_WRITEURL}

.PHONY: writeurl-server
writeurl-server: ${WRITEURL_SERVER}

.PHONY: test
test: ${TEST_MAIN}
	${TEST_MAIN}

.PHONY: objects
objects: ${OBJS}

.PHONY: clean
clean:
	${RM} ${STATIC_LIB}
	${RM} ${OBJS}
	${RM} ${DEPS}
	${RM} ${TEST_OBJS}
	${RM} ${TEST_DEPS}


all: libwriteurl test

-include $(DEPS)
-include ${TEST_DEPS}

print-%  : ; @echo $* = $($*)
