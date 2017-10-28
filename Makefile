WUL_HOME ?= ${realpath .}
BUILD_DIR ?= ${WUL_HOME}/build/release

${BUILD_DIR}:
	mkdir -p ${BUILD_DIR}

EXTERNAL := ${WUL_HOME}/external

CPPFLAGS := -MMD -MP
CFLAGS := -std=c11 -Wall -Wextra -pedantic -Wunreachable-code \
	-Wno-nested-anon-types -fno-elide-constructors -pthread \
	-Wno-unused-parameter

# zf_log

ZF_LOG_DIR := ${EXTERNAL}/zf_log/zf_log
ZF_LOG_SRC := ${ZF_LOG_DIR}/zf_log.c
ZF_LOG_BUILD_DIR := ${BUILD_DIR}/zf_log
${ZF_LOG_BUILD_DIR}:
	mkdir -p ${ZF_LOG_BUILD_DIR}
ZF_LOG_OBJ := ${ZF_LOG_BUILD_DIR}/zf_log.o
ZF_LOG_INC_FLAGS := -I${EXTERNAL}/zf_log
ZF_LOG_DEPS := ${ZF_LOG_OBJ:.o=.d}

${ZF_LOG_OBJ}: ${ZF_LOG_BUILD_DIR}

${ZF_LOG_OBJ}: ${ZF_LOG_SRC}
	${CC} ${ZF_LOG_INC_FLAGS} ${CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

# wul objects

WUL_SRC_DIR := ${WUL_HOME}/src/wul
WUL_SRCS := ${shell find ${WUL_SRC_DIR} -name '*.c'}
WUL_BUILD_DIR := ${BUILD_DIR}/wul
${WUL_BUILD_DIR}:
	mkdir -p ${WUL_BUILD_DIR}
WUL_OBJS := ${WUL_SRCS:${WUL_SRC_DIR}/%.c=${WUL_BUILD_DIR}/%.o}
WUL_DEPS := ${WUL_OBJS:.o=.d}

WUL_INC_FLAGS := -I${WUL_HOME}/src ${ZF_LOG_INC_FLAGS}

${WUL_OBJS}: ${WUL_BUILD_DIR}

${WUL_BUILD_DIR}/%.o: ${WUL_SRC_DIR}/%.c
	${CC} ${WUL_INC_FLAGS} ${CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

# libwriteurl

LIB_WRITEURL := ${BUILD_DIR}/libwriteurl.a

${LIB_WRITEURL}: ${BUILD_DIR}

${LIB_WRITEURL}: ${BUILD_DIR} ${WUL_OBJS} ${ZF_LOG_OBJ}
	${AR} -rcs $@ ${WUL_OBJS} ${ZF_LOG_OBJ}

# Writeurl server

SERVER_SRC := ${WUL_HOME}/src/main.c
SERVER_BUILD_DIR := ${BUILD_DIR}/server
${SERVER_BUILD_DIR}:
	mkdir -p ${SERVER_BUILD_DIR}
SERVER_OBJ := ${SERVER_BUILD_DIR}/main.o
SERVER_DEPS := ${SERVER_OBJ:.o=.d}

${SERVER_OBJ}: ${SERVER_BUILD_DIR} ${SERVER_SRC}
	${CC} ${WUL_INC_FLAGS} ${CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c ${SERVER_SRC} -o ${SERVER_OBJ}

SERVER := ${BUILD_DIR}/writeurl

${SERVER}: ${SERVER_OBJ} ${LIB_WRITEURL}
	${CC} ${EXTRA_LDFLAGS} $^ -o $@

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

.PHONY: writeurl
writeurl: ${SERVER}

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

-include ${ZF_LOG_DEPS}
-include $(WUL_DEPS)
-include ${WRITEURL_SERVER_DEPS}
-include ${TEST_DEPS}

print-%  : ; @echo $* = $($*)
