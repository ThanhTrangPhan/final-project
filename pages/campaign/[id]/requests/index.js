import React, { useState, useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { getETHPrice, getWEIPriceInUSD } from "../../../../lib/convert";
import {
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Text,
  Button,
  Flex,
  Container,
  SimpleGrid,
  Box,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tooltip,
  Tr,
  Th,
  Td,
  TableCaption,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  Stack,
  Link,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import web3 from "../../../../service/web3";
import Campaign from "../../../../service/campaign";

export async function getServerSideProps({ params }) {
  const campaignId = params.id;
  const campaign = Campaign(campaignId);
  const requestCount = await campaign.methods.getRequestsCount().call();
  const approversCount = await campaign.methods.approversCount().call();
  const summary = await campaign.methods.getSummary().call();
  const ETHPrice = await getETHPrice();

  return {
    props: {
      campaignId,
      requestCount,
      approversCount,
      balance: summary[1],
      name: summary[5],
      ETHPrice,
    },
  };
}

const RequestRow = ({
  id,
  request,
  approversCount,
  campaignId,
  disabled,
  ETHPrice,
}) => {
  const router = useRouter();
  const readyToFinalize = request.approvalCount > approversCount / 2;
  const [errorMessageApprove, setErrorMessageApprove] = useState();
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [errorMessageFinalize, setErrorMessageFinalize] = useState();
  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const onApprove = async () => {
    setLoadingApprove(true);
    try {
      const campaign = Campaign(campaignId);
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.approveRequest(id).send({
        from: accounts[0],
      });
      router.reload();
    } catch (err) {
      setErrorMessageApprove(err.message);
    } finally {
      setLoadingApprove(false);
    }
  };

  const onFinalize = async () => {
    setLoadingFinalize(true);
    try {
      const campaign = Campaign(campaignId);
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.finalizeRequest(id).send({
        from: accounts[0],
      });
      router.reload();
    } catch (err) {
      setErrorMessageFinalize(err.message);
    } finally {
      setLoadingFinalize(false);
    }
  };

  return (
    <Tr
      bg={
        readyToFinalize && !request.complete
          ? useColorModeValue("blue.100", "blue.700")
          : useColorModeValue("black.100", "black.700")
      }
      opacity={request.complete ? "0.4" : "1"}
    >
      <Td>{id} </Td>
      <Td>{request.description}</Td>
      <Td isNumeric>
        {web3.utils.fromWei(request.value, "ether")}ETH ($
        {getWEIPriceInUSD(ETHPrice, request.value)})
      </Td>
      <Td>
        <Link
          color="blue.500"
          href={`https://rinkeby.etherscan.io/address/${request.recipient}`}
          isExternal
        >
          {" "}
          {request.recipient.substr(0, 10) + "..."}
        </Link>
      </Td>
      <Td>
        {request.approvalCount}/{approversCount}
      </Td>
      <Td>
        <HStack spacing={2}>
          <Tooltip
            label={errorMessageApprove}
            bg={useColorModeValue("white", "blue.700")}
            placement={"top"}
            color={useColorModeValue("blue.800", "white")}
            fontSize={"1em"}
          >
            <WarningIcon
              color={useColorModeValue("red.600", "red.300")}
              display={errorMessageApprove ? "inline-block" : "none"}
            />
          </Tooltip>
          {request.complete ? (
            <Tooltip
              label="Yêu cầu này đã được biểu quyết"
              bg={useColorModeValue("white", "blue.700")}
              placement={"top"}
              color={useColorModeValue("blue.800", "white")}
              fontSize={"1em"}
            >
              <CheckCircleIcon
                color={useColorModeValue("green.600", "green.300")}
              />
            </Tooltip>
          ) : (
            <Button
              colorScheme="yellow"
              variant="outline"
              _hover={{
                bg: "yellow.600",
                color: "white",
              }}
              onClick={onApprove}
              isDisabled={disabled || request.approvalCount == approversCount}
              isLoading={loadingApprove}
            >
              Đồng ý 
            </Button>
          )}
        </HStack>
      </Td>
      <Td>
        <Tooltip
          label={errorMessageFinalize}
          bg={useColorModeValue("white", "blue.700")}
          placement={"top"}
          color={useColorModeValue("blue.800", "white")}
          fontSize={"1em"}
        >
          <WarningIcon
            color={useColorModeValue("red.600", "red.300")}
            display={errorMessageFinalize ? "inline-block" : "none"}
            mr="2"
          />
        </Tooltip>
        {request.complete ? (
          <Tooltip
              label="Yêu cầu này đac được biểu quyết"
            bg={useColorModeValue("white", "blue.700")}
            placement={"top"}
            color={useColorModeValue("blue.800", "white")}
            fontSize={"1em"}
          >
            <CheckCircleIcon
              color={useColorModeValue("green.600", "green.300")}
            />
          </Tooltip>
        ) : (
          <HStack spacing={2}>
            <Button
              colorScheme="green"
              variant="outline"
              _hover={{
                bg: "green.600",
                color: "white",
              }}
              isDisabled={disabled || (!request.complete && !readyToFinalize)}
              onClick={onFinalize}
              isLoading={loadingFinalize}
            >
              Xác nhận
            </Button>

            <Tooltip
              label="Yêu cầu này đã đạt hơn 50% đồng ý "
              bg={useColorModeValue("white", "blue.700")}
              placement={"top"}
              color={useColorModeValue("blue.800", "white")}
              fontSize={"1.2em"}
            >
              <InfoIcon
                as="span"
                color={useColorModeValue("purple.800", "white")}
                display={
                  readyToFinalize && !request.complete ? "inline-block" : "none"
                }
              />
            </Tooltip>
          </HStack>
        )}
      </Td>
    </Tr>
  );
};

export default function Requests({
  campaignId,
  requestCount,
  approversCount,
  balance,
  name,
  ETHPrice,
}) {
  const [requestsList, setRequestsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [FundNotAvailable, setFundNotAvailable] = useState(false);
  const campaign = Campaign(campaignId);
  async function getRequests() {
    try {
      const requests = await Promise.all(
        Array(parseInt(requestCount))
          .fill()
          .map((element, index) => {
            return campaign.methods.requests(index).call();
          })
      );

      console.log("requests", requests);
      setRequestsList(requests);
      setIsLoading(false);
      return requests;
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (balance == 0) {
      setFundNotAvailable(true);
    }
    getRequests();
  }, []);

  return (
    <div>
      <Head>
        <title>Yêu cầu rút quỹ </title>
        <meta name="description" content="Yêu cầu rút quỹ" />
        <link rel="icon" href="/icons8-kite-50.png" />
      </Head>

      <main>
        <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
          <Flex flexDirection={{ base: "column", md: "row" }} py={4}>
            <Box py="4">
              <Text fontSize={"lg"} color={"teal.400"}>
                <ArrowBackIcon mr={2} />
                <NextLink href={`/campaign/${campaignId}`}>
                  Quay lại 
                </NextLink>
              </Text>
            </Box>
            <Spacer />
            <Box py="4">
              Tổng quỹ còn lại  :{" "}
              <Text as="span" fontWeight={"bold"} fontSize="lg">
                {balance > 0
                  ? web3.utils.fromWei(balance, "ether")
                  : "0, Đóng góp quỹ"}
              </Text>
              <Text
                as="span"
                display={balance > 0 ? "inline" : "none"}
                pr={2}
                fontWeight={"bold"}
                fontSize="lg"
              >
                {" "}
                ETH
              </Text>
              <Text
                as="span"
                display={balance > 0 ? "inline" : "none"}
                fontWeight={"normal"}
                color={useColorModeValue("gray.500", "gray.200")}
              >
                (${getWEIPriceInUSD(ETHPrice, balance)})
              </Text>
            </Box>
          </Flex>
          {FundNotAvailable ? (
            <Alert status="error" my={4}>
              <AlertIcon />
              <AlertDescription>
                Tổng quỹ hiện giờ là 0, hãy đóng góp!
              </AlertDescription>
            </Alert>
          ) : null}
        </Container>
        {requestsList.length > 0 ? (
          <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
            <Flex flexDirection={{ base: "column", lg: "row" }} py={4}>
              <Box py="2" pr="2">
                <Heading
                  textAlign={useBreakpointValue({ base: "left" })}
                  fontFamily={"heading"}
                  color={useColorModeValue("gray.800", "white")}
                  as="h3"
                  isTruncated
                  maxW={"3xl"}
                >
                  Các yêu cầu rút quỹ của chiến dịch {name} 
                </Heading>
              </Box>
              <Spacer />
              <Box py="2">
                <NextLink href={`/campaign/${campaignId}/requests/new`}>
                  <Button
                    display={{ sm: "inline-flex" }}
                    justify={"flex-end"}
                    fontSize={"md"}
                    fontWeight={600}
                    color={"white"}
                    bg={"teal.400"}
                    href={"#"}
                    _hover={{
                      bg: "teal.300",
                    }}
                  >
                    Thêm các yêu cầu rút quỹ
                  </Button>
                </NextLink>
              </Box>
            </Flex>{" "}
            <Box overflowX="auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th w="30%">Chi tiết </Th>
                    <Th isNumeric>Số lượng </Th>
                    <Th maxW="12%" isTruncated>
                      Ví người nhận 
                    </Th>
                    <Th>Số lượng chấp thuận </Th>
                    <Th>Đồng ý </Th>
                    <Th>Kết thúc </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requestsList.map((request, index) => {
                    return (
                      <RequestRow
                        key={index}
                        id={index}
                        request={request}
                        approversCount={approversCount}
                        campaignId={campaignId}
                        disabled={FundNotAvailable}
                        ETHPrice={ETHPrice}
                      />
                    );
                  })}
                </Tbody>
                <TableCaption textAlign="left" ml="-2">
                  Có {requestCount} yêu cầu
                </TableCaption>
              </Table>
            </Box>
          </Container>
        ) : (
          <div>
            <Container
              px={{ base: "4", md: "12" }}
              maxW={"7xl"}
              align={"left"}
              display={isLoading ? "block" : "none"}
            >
              <SimpleGrid rows={{ base: 3 }} spacing={2}>
                <Skeleton height="2rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
              </SimpleGrid>
            </Container>
            <Container
              maxW={"lg"}
              align={"center"}
              display={
                requestsList.length === 0 && !isLoading ? "block" : "none"
              }
            >
              <SimpleGrid row spacing={2} align="center">
                <Stack align="center">
                  <NextImage
                    src="/static/no-requests.png"
                    alt="no-request"
                    width="150"
                    height="150"
                  />
                </Stack>
                <Heading
                  textAlign={"center"}
                  color={useColorModeValue("blue.800", "white")}
                  as="h4"
                  size="md"
                >
                  Chưa có yêu cầu nào cho chiến dịch {name} 
                </Heading>
                <Text
                  textAlign={useBreakpointValue({ base: "center" })}
                  color={useColorModeValue("blue.600", "blue.300")}
                  fontSize="sm"
                >
                  Tạo yêu cầu rút quỹ 
                </Text>

                <Button
                  fontSize={"md"}
                  fontWeight={600}
                  color={"white"}
                  bg={"teal.400"}
                  _hover={{
                    bg: "teal.300",
                  }}
                >
                  <NextLink href={`/campaign/${campaignId}/requests/new`}>
                    Tạo yêu cầu rút quỹ 
                  </NextLink>
                </Button>

                <Button
                  fontSize={"md"}
                  fontWeight={600}
                  color={"white"}
                  bg={"blue.400"}
                  _hover={{
                    bg: "blue.300",
                  }}
                >
                  <NextLink href={`/campaign/${campaignId}/`}>
                    Quay lại 
                  </NextLink>
                </Button>
              </SimpleGrid>
            </Container>
          </div>
        )}
      </main>
    </div>
  );
}
