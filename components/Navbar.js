import {Box,Flex,Button,Stack,useColorModeValue,Container,Heading,Menu,MenuButton, MenuList,MenuItem} from "@chakra-ui/react";
import { useWallet } from "use-wallet";

import NextLink from "next/link";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function NavBar() {
  const wallet = useWallet();

  return (
    <Box>
      <Flex>
        <Container as={Flex} maxW={"7xl"} align={"center"}>
          <Flex flex={{ base: 1 }} justify="start" ml={{ base: -2, md: 0 }}>
            <Heading
              textAlign="left"
              fontFamily={"heading"}
              color={useColorModeValue("purple.800", "white")}
              as="h2"
              size="lg"
            >
              <Box
                as={"span"}
                color={useColorModeValue("blue.400", "blue.300")}
                position={"relative"}
                zIndex={10}
                _after={{
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  w: "full",
                  h: "30%",
                  bg: useColorModeValue("blue.100", "blue.900"),
                  zIndex: -1,
                }}
              >
                <NextLink href="/" img = "../"> Diều Xanh</NextLink>
              </Box>
            </Heading>
          </Flex>
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
            display={{ base: "none", md: "flex" }}
          >
            {wallet.status === "connected" ? (
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                  {wallet.account.substr(0, 10) + "..."}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => wallet.reset()}>
                    {" "}
                    Ngắt kết nối ví {" "}
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <div>
                <Button
                  display={{ base: "none", md: "inline-flex" }}
                  fontSize={"md"}
                  fontWeight={600}
                  color={"white"}
                  bg={"blue.400"}
                  href={"#"}
                  _hover={{
                    bg: "blue.300",
                  }}
                  onClick={() => wallet.connect()}
                >
                  Kết nối ví{" "}
                </Button>
              </div>
            )}
          </Stack>

          
        </Container>
      </Flex>
    </Box>
  );
}
